'use client';

import { useTranslation } from '../../../app/lib/useTranslation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../../../components/ui/button';
import { useEffect, useState } from 'react';
import { Badge } from '../../../components/ui/badge';

/**
 * Modern hero section for the homepage with split layout, carousel and animations
 */
export const HeroSection = () => {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Carousel images
  const carouselImages = [
    "https://images.unsplash.com/photo-1536819114556-1e10f967fb61?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1503262028195-93c528f03218?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1519181236443-b175d4c3ca1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    "/images/products/product-oil-1.jpg",
  ];
  
  // Animation effect when component mounts
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  // Carousel auto-rotation
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % carouselImages.length
        );
      }, 5000); // Change slide every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying, carouselImages.length]);
  
  // Carousel navigation functions
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false); // Pause autoplay when manually navigating
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % carouselImages.length
    );
    setIsAutoPlaying(false); // Pause autoplay when manually navigating
  };

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
    setIsAutoPlaying(false); // Pause autoplay when manually navigating
  };
  
  // Trust badges data
  const trustBadges = [
    { icon: 'verified', text: 'Lab Tested' },
    { icon: 'local_shipping', text: 'Free Shipping' },
    { icon: 'eco', text: 'Organic' },
    { icon: 'thumb_up', text: '5-Star Reviews' },
  ];
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-accent via-accent/50 to-white py-16 md:py-24">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCAzLjk4LTEuNzggMy45OC0zLjk4bC4wMi0uMDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left content - Text and CTA */}
          <div className={`transition-all duration-700 ease-out ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm text-primary px-4 py-1.5 mb-6 text-sm font-medium rounded-full">
              <span className="material-icons text-sm mr-1">spa</span> Premium Cannabis Seeds
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary mb-6 leading-tight">
              {t.hero.title}
            </h1>
            
            <p className="text-xl text-primary-dark mb-8 max-w-lg">
              {t.hero.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="relative overflow-hidden group">
                <span className="relative z-10">{t.hero.cta}</span>
                <span className="absolute inset-0 bg-primary-light transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              </Button>
              
              <Button variant="outline" size="lg" className="border-2">
                Learn More
              </Button>
            </div>
            
            {/* Trust badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trustBadges.map((badge, index) => (
                <div 
                  key={index} 
                  className={`flex items-center bg-white/70 backdrop-blur-sm rounded-lg p-3 shadow-sm transition-all duration-700 ease-out ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                  style={{ transitionDelay: `${index * 100 + 300}ms` }}
                >
                  <span className="material-icons text-primary mr-2">{badge.icon}</span>
                  <span className="text-sm font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right content - Carousel */}
          <div className={`relative transition-all duration-700 ease-out ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
              {/* Carousel images */}
              {carouselImages.map((image, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    currentImageIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <Image 
                    src={image} 
                    alt={`Cannabis Seeds Image ${index + 1}`} 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              ))}
              
              {/* Carousel navigation buttons */}
              <button 
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors duration-300"
                aria-label="Previous slide"
              >
                <span className="material-icons">chevron_left</span>
              </button>
              
              <button 
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors duration-300"
                aria-label="Next slide"
              >
                <span className="material-icons">chevron_right</span>
              </button>
              
              {/* Carousel indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      currentImageIndex === index ? 'bg-white shadow-md' : 'bg-white/60'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              
              {/* Floating product card */}
              <div className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-[200px] transform rotate-3 transition-transform hover:rotate-0 duration-300 z-30">
                <div className="text-sm font-bold text-primary mb-1">Bestseller</div>
                <div className="text-base font-heading font-bold mb-1">Northern Lights</div>
                <div className="text-primary-dark text-sm mb-2">Feminized | 5 Seeds</div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary">€29.95</span>
                  <Button size="sm" variant="secondary" className="h-8 px-3 py-1">
                    <span className="material-icons text-sm mr-1">add_shopping_cart</span>
                    Add
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Floating review */}
            <div className="absolute top-10 -left-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-[180px] transform -rotate-3 transition-transform hover:rotate-0 duration-300 z-30">
              <div className="flex text-yellow-400 mb-2">
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
                <span className="material-icons text-sm">star</span>
              </div>
              <div className="text-sm italic">&ldquo;Amazing genetics! All seeds germinated perfectly.&rdquo;</div>
              <div className="text-xs text-primary-dark mt-2">- Thomas R.</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C0,0,0,0,0,0Z" className="fill-white"></path>
        </svg>
      </div>
    </section>
  );
};
