import 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string | null;
            image?: string | null;
            role: string;
            phone?: string | null;
            vendorId?: string;
            vendorStatus?: string;
        };
    }

    interface User {
        id: string;
        email: string;
        name?: string | null;
        image?: string | null;
        role: string;
        vendor?: {
            id: string;
            status: string;
        } | null;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: string;
        vendorId?: string;
        vendorStatus?: string;
    }
}
