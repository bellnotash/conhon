module.exports = function handler(request, response) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  response.setHeader("Cache-Control", "no-store, max-age=0");

  if (!supabaseUrl || !publishableKey) {
    return response.status(500).json({
      error:
        "Thieu NEXT_PUBLIC_SUPABASE_URL hoac NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY tren Vercel.",
    });
  }

  return response.status(200).json({
    supabaseUrl,
    publishableKey,
  });
};
