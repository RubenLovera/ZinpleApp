export function checkEnvironmentVariables() {
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  console.log("Environment Variables Check:")
  Object.entries(requiredVars).forEach(([key, value]) => {
    console.log(`${key}: ${value ? "✅ Present" : "❌ Missing"}`)
    if (value) {
      console.log(`  Value starts with: ${value.substring(0, 20)}...`)
    }
  })

  const allPresent = Object.values(requiredVars).every((value) => value)

  if (allPresent) {
    console.log("✅ All required environment variables are present!")
  } else {
    console.error("❌ Some environment variables are missing!")
  }

  return requiredVars
}
