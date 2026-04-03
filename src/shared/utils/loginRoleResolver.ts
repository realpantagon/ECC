import type { Role } from "../../types/User";

const ROLE_ALIAS_MAP: Record<string, Role> = {
    participant: "participant",
    buddy: "buddy",
    buudy: "buddy",
    admin: "admin",
    "ecc-admin": "admin",
};

export function resolveLoginRole(searchParams: URLSearchParams): Role {
    const rawRole =
        searchParams.get("params") ??
        searchParams.get("role") ??
        searchParams.get("as");

    return resolveLoginRoleFromRaw(rawRole);
}

export function resolveLoginRoleFromRaw(rawRole?: string | null): Role {

    if (!rawRole) {
        return "participant";
    }

    return ROLE_ALIAS_MAP[rawRole.trim().toLowerCase()] ?? "participant";
}
