import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Manually parse .env since dotenv might not be installed
const envPath = path.resolve(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
let url = "";
let key = "";

envContent.split(/\r?\n/).forEach((line) => {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) url = line.substring(line.indexOf("=") + 1).trim();
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) key = line.substring(line.indexOf("=") + 1).trim();
});

const supabase = createClient(url, key);

async function addUsers() {
  const users = [
    { email: "aryan@prolx.cloud", password: "Admin123###" },
    { email: "yassen@prolx.cloud", password: "Admin123###" },
  ];

  for (const user of users) {
    console.log(`Checking if user exists: ${user.email}`);
    
    // Attempt sign-in first to see if they exist
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });

    if (!signInError) {
      console.log(`[Success] User already exists and is valid: ${user.email}`);
      continue;
    }

    console.log(`Attempting to sign up user: ${user.email} with URL: ${url}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          full_name: user.email.split("@")[0],
          name: user.email.split("@")[0],
          email: user.email,
        },
      },
    });

    if (signUpError) {
      console.error(`[Error] Failed to sign up ${user.email}:`, JSON.stringify(signUpError, null, 2));
    } else {
      console.log(`[Success] User created ${user.email}. ID: ${signUpData?.user?.id}`);
    }
  }
}

addUsers().catch(console.error);
