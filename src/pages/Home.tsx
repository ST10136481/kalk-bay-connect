import React from 'react';
import Hero from '../components/Hero';
import HomeAbout from '../components/HomeAbout';
import Contact from '../components/Contact';

const Home = () => {
  return (
    <div>
      <Hero />
      <HomeAbout />
      <Contact />
    </div>
  );
};

export default Home;