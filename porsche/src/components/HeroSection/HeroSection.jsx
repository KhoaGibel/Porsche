import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './HeroSection.css'; 

export default function HeroSection({ id, title, bgImage, nextSectionId }) {
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const scaleBg = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const opacityBg = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0px", "-150px"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section id={id} ref={ref} className="section-snap">
      
      <motion.img 
        style={{ scale: scaleBg, opacity: opacityBg }}
        src={bgImage} 
        alt={title} 
        className="hero-bg" 
      />
      
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <motion.div 
          style={{ y: yText, opacity: opacityText }}
          className="text-center pointer-events-auto"
        >
          <h1 className="text-white text-5xl md:text-7xl font-bold tracking-widest drop-shadow-lg mb-2">
            {title}
          </h1>
          <a href={`#${nextSectionId}`} className="text-white text-sm underline hover:text-gray-300 drop-shadow-md transition-colors duration-300">
            Schedule a demo drive
          </a>
        </motion.div>

        <motion.div 
          style={{ opacity: opacityText }}
          className="flex gap-6 mt-auto pointer-events-auto"
        >
          <button className="btn-primary">Custom Order</button>
          <button className="btn-secondary">View Inventory</button>
        </motion.div>
      </div>

    </section>
  );
}