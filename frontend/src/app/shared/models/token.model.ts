interface TokenAttributes {
    trait_type: string;
    value: string;
}

export interface SBT {
    description: string;
    external_url: string;
    image: string;
    name: string;
    attributes: TokenAttributes;
}
