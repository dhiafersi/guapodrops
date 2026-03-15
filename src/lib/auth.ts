import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";
import GoogleProvider from "next-auth/providers/google";

// Match the DB Schema representation for User
interface UserRow {
    id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    password?: string;
    role: 'USER' | 'ADMIN';
}

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                // Query raw database for user
                const users = await query<UserRow[]>(
                    'SELECT * FROM users WHERE email = ? LIMIT 1',
                    [credentials.email]
                );

                if (users.length === 0) {
                    throw new Error("Invalid credentials");
                }

                const user = users[0];

                if (!user.password) {
                    throw new Error("Invalid credentials");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    location: user.location,
                    role: user.role,
                };
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user, trigger, session, account }) {
            // Determine if logging in via Google
            if (account?.provider === "google" && user) {
                // Find existing user by email
                let dbUsers = await query<UserRow[]>('SELECT * FROM users WHERE email = ? LIMIT 1', [user.email]);

                if (dbUsers.length === 0) {
                    const id = "USER_" + Date.now().toString() + Math.random().toString(36).substring(2, 6).toUpperCase();
                    await query(
                        'INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)',
                        [id, user.name || 'Google User', user.email, 'USER']
                    );
                    dbUsers = [{ id, name: user.name as string, email: user.email as string, role: 'USER' }];
                }

                const dbUser = dbUsers[0];
                token.role = dbUser.role;
                token.id = dbUser.id;
                token.name = dbUser.name;
                token.email = dbUser.email;
                token.phone = dbUser.phone;
                token.location = dbUser.location;
            } else if (user) {
                // Standard Credentials login
                token.role = (user as any).role;
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.phone = (user as any).phone;
                token.location = (user as any).location;
            }

            if (trigger === "update" && session?.user) {
                token.name = session.user.name;
                token.email = session.user.email;
                token.phone = (session.user as any).phone;
                token.location = (session.user as any).location;
            }

            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.name = token.name;
                session.user.email = token.email as string;
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).phone = token.phone;
                (session.user as any).location = token.location;
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/login",
    }
};
