// Placeholder route handler - pipeline functionality not yet implemented
export const GET = () => {
  return new Response(
    JSON.stringify({ 
      status: 'not implemented',
      message: 'Pipeline API endpoint is in development'
    }),
    {
      status: 501,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};
