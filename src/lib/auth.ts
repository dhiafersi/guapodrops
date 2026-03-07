import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

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
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.phone = (user as any).phone;
                token.location = (user as any).location;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
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
