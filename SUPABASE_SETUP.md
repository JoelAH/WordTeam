# Supabase Setup Instructions

To set up Supabase for authentication in this project, follow these steps:

1. Create a Supabase account at [https://supabase.com](https://supabase.com) if you don't have one already.

2. Create a new project in Supabase.

3. Once your project is created, go to the project settings and find your API keys:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your project's anon/public key

4. Create a `.env.local` file in the root of your project with the following content:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. Replace `your-supabase-url` and `your-supabase-anon-key` with your actual Supabase project URL and anon key.

6. In your Supabase project, go to Authentication > Settings and enable Email/Password authentication.

7. You can customize the email templates and other authentication settings in the Supabase dashboard.

8. Restart your Next.js development server to apply the changes.

## Database Schema

For this project, we're using Supabase for authentication only. The game data is stored in your MongoDB database.

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs) 