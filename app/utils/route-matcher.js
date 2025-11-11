// utils/route-matcher.js
export const findActivePage = (pathname, navItems) => {
    const cleanPathname = pathname.replace(/\/+$/, '');
    
    // 1. Find exact matches first
    const exactMatch = navItems.find(item => 
      item.exact && cleanPathname === item.href
    );
    if (exactMatch) return exactMatch;
    
    // 2. Find the most specific prefix match
    const matchedItems = navItems.filter(item => 
      !item.exact && cleanPathname.startsWith(item.href)
    );
    
    // Sort by longest href to get most specific match first
    matchedItems.sort((a, b) => b.href.length - a.href.length);
    
    return matchedItems[0] || navItems[0];
  };