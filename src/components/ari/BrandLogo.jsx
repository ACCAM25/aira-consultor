import React from 'react';

export const brandLogoUrl = '/logo-branco.jpg';
export const darkBrandLogoUrl = '/logo-azul.jpg';

export default function BrandLogo({ className = 'h-10 w-20' }) {
  return <span className={`${className} shrink-0 inline-block`}>
    <img src={brandLogoUrl} alt="Logo do AIra Consultor" className="h-full w-full object-contain dark:hidden" />
    <img src={darkBrandLogoUrl} alt="Logo do AIra Consultor" className="hidden h-full w-full object-contain dark:block" />
  </span>;
}
