export interface Product {
    id: number;
    name: string;
    engName: string;
    description: string;
    engDescription: string;
    ingredients: string[];
    engIngredients: string[];
    allergens: string[];
    engAllergens: string[];
    price: number;
    quantity: number;
    image: string;
    modelPath?: string;
}
