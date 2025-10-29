// Déclarations pour les fichiers JavaScript/JSX
declare module '*.jsx' {
  import React from 'react';
  const component: React.ComponentType<any>;
  export default component;
}

declare module '*.js' {
  const value: any;
  export default value;
}

// Déclarations pour les modules CSS
declare module '*.css' {
  const content: any;
  export default content;
}

declare module '*.scss' {
  const content: any;
  export default content;
}