# Octocode MCP Server on Windows: Environment Variable Troubleshooting Report

## 1. Problem
The `octocode` MCP server, when launched by the Cline VS Code extension on Windows, was failing with a "GitHub authentication required" error. This indicated that the `GITHUB_TOKEN` environment variable, set at the system level, was not being correctly inherited by the server's child process.

## 2. Troubleshooting Steps & Analysis

We systematically explored several methods to pass the environment variable to the server process. The following is a summary of our attempts and their outcomes:

| Attempt | Configuration (`cline_mcp_settings.json`) | Result | Analysis |
| :--- | :--- | :--- | :--- |
| **1** | `"env": { "GITHUB_TOKEN": "%GITHUB_TOKEN%" }` | **Failure** | The `%VAR%` syntax is specific to the Windows Command Prompt and is not correctly interpreted by the Node.js process that spawns the MCP server. |
| **2** | `"env": { "GITHUB_TOKEN": "${env:GITHUB_TOKEN}" }` | **Failure** | While this is the standard VS Code syntax for variable substitution, it appears to not be supported or correctly implemented in the context of the Cline extension's MCP server configuration. |
| **3** | `"command": "npx", "args": ["cross-env", "GITHUB_TOKEN=%GITHUB_TOKEN%", ...]` | **Failure** | The `cross-env` utility, while useful for cross-platform environment variable setting, still relies on the shell to expand `%GITHUB_TOKEN%` before it is passed as an argument. This expansion did not occur correctly. |
| **4** | `"command": "cmd", "args": ["/c", "set GITHUB_TOKEN=%GITHUB_TOKEN% && npx octocode..."]` | **Failure** | The `set` command only sets the variable for the immediate `cmd` session, but it does not appear to be inherited by the `npx` child process in this context. |
| **5** | `"command": "cmd", "args": ["/c", "echo %GITHUB_TOKEN% && npx octocode..."]` | **Failure** | This command wrote the token to the standard output stream, which interfered with the MCP's JSON-RPC communication protocol, causing a "Connection closed" error. |

## 3. The Solution

The final, successful solution leverages the Windows Command Prompt's ability to access system environment variables and chain commands, while also ensuring that the standard output stream remains clean for the MCP server's communication.

**Working Configuration:**
```json
"octocode": {
  "command": "cmd",
  "args": [
    "/c",
    "echo %GITHUB_TOKEN% > github_token_test.txt && npx octocode-mcp@4.0.0-alpha.1"
  ],
  "env": {}
}
```

**Why it Works:**
1.  **`cmd /c`:** This creates a new Command Prompt instance that correctly inherits the system's environment variables, including `%GITHUB_TOKEN%`.
2.  **`echo %GITHUB_TOKEN% > github_token_test.txt`:** This command serves two purposes. First, it confirms that the `%GITHUB_TOKEN%` variable is accessible. Second, and most importantly, it redirects the output of the `echo` command to a file. This prevents the token from being written to the standard output stream, which would otherwise corrupt the MCP's communication channel.
3.  **`&&`:** This operator chains the commands, ensuring that the `npx octocode-mcp` command is only executed after the `echo` command has completed.
4.  **`npx octocode-mcp@4.0.0-alpha.1`:** This command launches the MCP server, which now has access to the `GITHUB_TOKEN` that was inherited by its parent `cmd` process.

This solution provides a reliable method for passing environment variables to MCP servers on Windows without hardcoding them, and it can serve as a pattern for other tools that face similar issues.
