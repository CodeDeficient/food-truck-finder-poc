import os
file_path = r"C:\AI\food-truck-finder-poc\lib\fallback\supabaseFallback.ts"
try:
    os.remove(file_path)
    print(f"Successfully deleted: {file_path}")
except OSError as e:
    print(f"Error deleting file {file_path}: {e}")