import { useState } from 'react';
import { TypographyH3 } from './typography/TypographyH3';

function Sidebar() {
  const [selectedCategory, setSelectedCategory] = useState();

  return (
    <div className="w-64 px-10 py-12">
      <TypographyH3 className="border-b-[1px] pb-2">카테고리</TypographyH3>
      <div></div>
    </div>
  );
}

export default Sidebar;
