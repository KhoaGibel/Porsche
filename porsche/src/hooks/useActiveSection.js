import { useState, useEffect } from 'react';

/**
 * Theo dõi section nào đang hiện trong viewport, dùng để đổi màu Navbar.
 * @param {string[]} sectionIds - danh sách id của các section cần theo dõi, theo thứ tự xuất hiện trên trang
 * @returns {string} id của section đang active nhiều nhất trong viewport
 */
export function useActiveSection(sectionIds) {
  const [activeId, setActiveId] = useState(sectionIds[0]);

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Chọn entry có tỉ lệ hiện trong viewport lớn nhất
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Coi như "active" khi section chiếm > 50% viewport theo chiều dọc giữa
        threshold: [0.3, 0.5, 0.7],
        rootMargin: '-80px 0px 0px 0px', // trừ đi chiều cao navbar (80px)
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}