interface TokenAttributes {
    trait_type: string;
    value: string;
}

export interface SBT {
    description: string;
    image: string | File;
    name: string;
    attributes?: TokenAttributes;
    external_url?: string;
}
