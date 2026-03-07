import "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        role: "USER" | "ADMIN";
        phone?: string;
        location?: string;
    }

    interface Session {
        user: User & {
            id: string;
            role: "USER" | "ADMIN";
            phone?: string;
            location?: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "USER" | "ADMIN";
        phone?: string;
        location?: string;
    }
}
