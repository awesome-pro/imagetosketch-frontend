enum UserRole {
   USER = 'USER',
   ADMIN = 'ADMIN'
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    DELETED = 'DELETED',
    TRIAL_ENDED = 'TRIAL_ENDED'
}

export enum ConnectionStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    AUTHORIZED = 'AUTHORIZED',
    REVOKED = 'REVOKED'
}

export enum DealStatus {
    NEGOTIATION = 'NEGOTIATION',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PENDING = 'PENDING', 
    DRAFT = 'DRAFT'   
}

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: UserRole;
    status: UserStatus;
}

export enum Plan {
    STARTER = 'STARTER',
    PRO = 'PRO',
    ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    TRIAL = 'TRIAL',
    CANCELLED = 'CANCELLED'
}

export interface Subscription {
    id: string;
    userId: string;
    price: number;
    plan: Plan;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
}