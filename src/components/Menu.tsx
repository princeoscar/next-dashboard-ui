"use client";

import Image from "next/image";
import Link from "next/link";

// ... (keep your menuItems array exactly as it is) ...

// Added isMobile prop to handle visibility logic
const Menu = ({ role, isMobile = false }: { role: string; isMobile?: boolean }) => {
  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          {/* 
             If isMobile is true, we show the title. 
             If not, we only show it on Large screens (lg:block).
          */}
          <span className={`${isMobile ? "block" : "hidden lg:block"} text-gray-400 font-light my-4`}>
            {i.title}
          </span>

          {i.items.map((item) => {
            if (item.visible.includes(role)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  // On mobile/drawer, we always want justify-start and gap-4
                  className={`flex items-center ${
                    isMobile ? "justify-start" : "justify-center lg:justify-start"
                  } gap-4 text-gray-500 py-2 px-2 rounded-md hover:bg-lamaSkyLight`}
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  
                  {/* 
                     The Label Fix: 
                     If isMobile is true, show the text. 
                     Otherwise, hide it until 'lg' screens.
                  */}
                  <span className={isMobile ? "block" : "hidden lg:block"}>
                    {item.label}
                  </span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;