export interface CharacterTrait {
    name: string;
    description: string;
  }
  
  export interface Character {
    name?: string;
    role?: string;
    traits?: CharacterTrait[];
    basePersonality?: string;
    language?: string;
    customPrompt?: string;
  }