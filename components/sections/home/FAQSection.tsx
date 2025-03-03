'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from '../../../app/lib/useTranslation';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion';

// FAQ item type
type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'germination' | 'shipping' | 'strains';
};

/**
 * Modern FAQ section for the homepage
 */
export const FAQSection = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Create a memoized translation getter function to avoid recreating the object on each render
  const getTranslation = useMemo(() => {
    return {
      getFaqTitle: () => (t as any).faq?.title || "Frequently Asked Questions",
      getFaqSubtitle: () => (t as any).faq?.subtitle || "Find answers to common questions about cannabis seeds, germination, and shipping",
      getFaqBadge: () => (t as any).faq?.badge || "Grower's Guide",
      getSearchPlaceholder: () => (t as any).faq?.searchPlaceholder || "Search for answers...",
      getNoResults: () => (t as any).faq?.noResults || "No questions found matching your search.",
      getCategoryAll: () => (t as any).faq?.categories?.all || "All Questions",
      getCategoryGeneral: () => (t as any).faq?.categories?.general || "General",
      getCategoryGermination: () => (t as any).faq?.categories?.germination || "Germination & Growing",
      getCategoryStrains: () => (t as any).faq?.categories?.strains || "Strain Information",
      getCategoryShipping: () => (t as any).faq?.categories?.shipping || "Shipping & Delivery",
      getQuestionFeminizedSeeds: () => (t as any).faq?.questions?.feminizedSeeds?.question || "What are feminized seeds?",
      getAnswerFeminizedSeeds: () => (t as any).faq?.questions?.feminizedSeeds?.answer || "Feminized cannabis seeds are genetically engineered to produce only female plants. This is beneficial for growers as female plants produce the cannabinoid-rich flowers (buds) that most collectors and growers desire. Using feminized seeds eliminates the need to identify and remove male plants.",
      getQuestionAutofloweringSeeds: () => (t as any).faq?.questions?.autofloweringSeeds?.question || "What are autoflowering seeds?",
      getAnswerAutofloweringSeeds: () => (t as any).faq?.questions?.autofloweringSeeds?.answer || "Autoflowering seeds produce plants that automatically transition from vegetative growth to flowering based on age, rather than light cycle changes. These plants typically grow smaller, mature faster (8-10 weeks from seed to harvest), and are more resilient to environmental stressors, making them ideal for beginners and growers in challenging climates.",
      getQuestionGermination: () => (t as any).faq?.questions?.germination?.question || "What's the best way to germinate cannabis seeds?",
      getAnswerGermination: () => (t as any).faq?.questions?.germination?.answer || "The paper towel method is popular and effective: Place seeds between damp paper towels on a plate, cover with another plate to retain moisture, and keep in a warm, dark place (21-25°C). Check daily and keep towels moist. Seeds typically sprout in 1-5 days. Once taproots appear (2-3mm long), carefully transfer to your growing medium.",
      getQuestionStorage: () => (t as any).faq?.questions?.storage?.question || "How should I store my cannabis seeds?",
      getAnswerStorage: () => (t as any).faq?.questions?.storage?.answer || "For long-term storage, keep seeds in an airtight container in a cool, dark place. Ideal conditions are 6-8°C with 20-30% relative humidity. A sealed container in the refrigerator (not freezer) works well. Avoid temperature fluctuations and exposure to light, which can trigger germination or reduce viability.",
      getQuestionStrainDifferences: () => (t as any).faq?.questions?.strainDifferences?.question || "What's the difference between Indica, Sativa, and Hybrid strains?",
      getAnswerStrainDifferences: () => (t as any).faq?.questions?.strainDifferences?.answer || "Indica strains typically produce shorter, bushier plants with broader leaves and denser buds. Sativa strains generally grow taller with narrower leaves and more elongated buds. Hybrids combine characteristics from both parent types. Each strain offers unique growth patterns, flowering times, yields, and effects, allowing collectors to choose based on their preferences and growing conditions.",
      getQuestionCbdStrains: () => (t as any).faq?.questions?.cbdStrains?.question || "What are CBD-rich cannabis seeds?",
      getAnswerCbdStrains: () => (t as any).faq?.questions?.cbdStrains?.answer || "CBD-rich cannabis seeds produce plants with higher levels of cannabidiol (CBD) and lower levels of THC. These strains have been specifically bred to enhance the CBD content while minimizing psychoactive effects, making them popular for those interested in the potential therapeutic benefits of cannabis without strong intoxication.",
      getQuestionShipping: () => (t as any).faq?.questions?.shipping?.question || "How do you ship cannabis seeds?",
      getAnswerShipping: () => (t as any).faq?.questions?.shipping?.answer || "We ship all seeds in discreet, crush-proof packaging with no indication of the contents. Orders are processed within 24-48 hours and typically arrive within 3-7 business days for European countries and 7-14 days for international orders. All shipments include tracking information sent to your email.",
      getQuestionInternational: () => (t as any).faq?.questions?.international?.question || "Do you ship internationally?",
      getAnswerInternational: () => (t as any).faq?.questions?.international?.answer || "Yes, we ship to most countries where it's legal to import cannabis seeds as a souvenir or collector's item. However, it's the customer's responsibility to check local laws regarding cannabis seeds. We cannot be held responsible for customs seizures, though our discreet packaging minimizes this risk.",
      getQuestionPayment: () => (t as any).faq?.questions?.payment?.question || "What payment methods do you accept?",
      getAnswerPayment: () => (t as any).faq?.questions?.payment?.answer || "We accept credit/debit cards, bank transfers, and various cryptocurrencies including Bitcoin, Ethereum, and Litecoin. Cryptocurrency payments offer an additional layer of privacy and often qualify for a 10% discount on your order.",
      getRecommendedProducts: () => (t as any).faq?.recommendedProducts || "Recommended seeds:",
      getFeminizedSeeds: () => (t as any).faq?.feminizedSeeds || "Premium Feminized Seeds",
      getAutofloweringSeeds: () => (t as any).faq?.autofloweringSeeds || "Fast Autoflowering Seeds",
      getStillHaveQuestions: () => (t as any).faq?.stillHaveQuestions || "Still have questions?",
      getSupportText: () => (t as any).faq?.supportText || "Our customer support team is here to help. Reach out to us and we'll get back to you as soon as possible.",
      getContactSupport: () => (t as any).faq?.contactSupport || "Contact Support"
    };
  }, [t]);
  
  // Create a local translations object with fallbacks
  const faqTranslations = useMemo(() => ({
    title: getTranslation.getFaqTitle(),
    subtitle: getTranslation.getFaqSubtitle(),
    badge: getTranslation.getFaqBadge(),
    searchPlaceholder: getTranslation.getSearchPlaceholder(),
    noResults: getTranslation.getNoResults(),
    categories: {
      all: getTranslation.getCategoryAll(),
      general: getTranslation.getCategoryGeneral(),
      germination: getTranslation.getCategoryGermination(),
      strains: getTranslation.getCategoryStrains(),
      shipping: getTranslation.getCategoryShipping()
    },
    questions: {
      feminizedSeeds: {
        question: getTranslation.getQuestionFeminizedSeeds(),
        answer: getTranslation.getAnswerFeminizedSeeds()
      },
      autofloweringSeeds: {
        question: getTranslation.getQuestionAutofloweringSeeds(),
        answer: getTranslation.getAnswerAutofloweringSeeds()
      },
      germination: {
        question: getTranslation.getQuestionGermination(),
        answer: getTranslation.getAnswerGermination()
      },
      storage: {
        question: getTranslation.getQuestionStorage(),
        answer: getTranslation.getAnswerStorage()
      },
      strainDifferences: {
        question: getTranslation.getQuestionStrainDifferences(),
        answer: getTranslation.getAnswerStrainDifferences()
      },
      cbdStrains: {
        question: getTranslation.getQuestionCbdStrains(),
        answer: getTranslation.getAnswerCbdStrains()
      },
      shipping: {
        question: getTranslation.getQuestionShipping(),
        answer: getTranslation.getAnswerShipping()
      },
      international: {
        question: getTranslation.getQuestionInternational(),
        answer: getTranslation.getAnswerInternational()
      },
      payment: {
        question: getTranslation.getQuestionPayment(),
        answer: getTranslation.getAnswerPayment()
      }
    },
    recommendedProducts: getTranslation.getRecommendedProducts(),
    feminizedSeeds: getTranslation.getFeminizedSeeds(),
    autofloweringSeeds: getTranslation.getAutofloweringSeeds(),
    stillHaveQuestions: getTranslation.getStillHaveQuestions(),
    supportText: getTranslation.getSupportText(),
    contactSupport: getTranslation.getContactSupport()
  }), [getTranslation]);
  
  // Intersection observer to trigger animation when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  // FAQ data with categories from translations
  const faqs: FAQItem[] = useMemo(() => [
    {
      id: 'faq1',
      question: faqTranslations.questions.feminizedSeeds.question,
      answer: faqTranslations.questions.feminizedSeeds.answer,
      category: 'general'
    },
    {
      id: 'faq2',
      question: faqTranslations.questions.autofloweringSeeds.question,
      answer: faqTranslations.questions.autofloweringSeeds.answer,
      category: 'general'
    },
    {
      id: 'faq3',
      question: faqTranslations.questions.germination.question,
      answer: faqTranslations.questions.germination.answer,
      category: 'germination'
    },
    {
      id: 'faq4',
      question: faqTranslations.questions.storage.question,
      answer: faqTranslations.questions.storage.answer,
      category: 'germination'
    },
    {
      id: 'faq5',
      question: faqTranslations.questions.strainDifferences.question,
      answer: faqTranslations.questions.strainDifferences.answer,
      category: 'strains'
    },
    {
      id: 'faq6',
      question: faqTranslations.questions.cbdStrains.question,
      answer: faqTranslations.questions.cbdStrains.answer,
      category: 'strains'
    },
    {
      id: 'faq7',
      question: faqTranslations.questions.shipping.question,
      answer: faqTranslations.questions.shipping.answer,
      category: 'shipping'
    },
    {
      id: 'faq8',
      question: faqTranslations.questions.international.question,
      answer: faqTranslations.questions.international.answer,
      category: 'shipping'
    },
    {
      id: 'faq9',
      question: faqTranslations.questions.payment.question,
      answer: faqTranslations.questions.payment.answer,
      category: 'shipping'
    }
  ], [faqTranslations]);
  
  // Filter FAQs based on search query and active category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Group FAQs by category for the tabs
  const faqsByCategory = {
    all: filteredFaqs,
    general: filteredFaqs.filter(faq => faq.category === 'general'),
    germination: filteredFaqs.filter(faq => faq.category === 'germination'),
    strains: filteredFaqs.filter(faq => faq.category === 'strains'),
    shipping: filteredFaqs.filter(faq => faq.category === 'shipping'),
  };
  
  return (
    <section className="py-20 bg-gradient-to-br from-white to-accent/20 relative overflow-hidden" ref={sectionRef}>
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(215,243,220,0.3),transparent_70%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(215,243,220,0.3),transparent_70%)]"></div>
      </div>
      
      {/* Question mark decorations */}
      <div className="absolute top-20 left-10 text-primary/5 -z-5">
        <span className="material-icons text-[150px]">help_outline</span>
      </div>
      <div className="absolute bottom-20 right-10 text-primary/5 -z-5 rotate-12">
        <span className="material-icons text-[100px]">help</span>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="flex flex-col items-center mb-12">
          <Badge variant="outline" className="mb-4">{faqTranslations.badge}</Badge>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-primary mb-4">
            {faqTranslations.title}
          </h2>
          <p className="mt-2 text-center text-gray-600 max-w-2xl">
            {faqTranslations.subtitle}
          </p>
        </div>
        
        {/* Search bar */}
        <div className={`max-w-md mx-auto mb-8 transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <span className="material-icons">search</span>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={faqTranslations.searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <span className="material-icons">close</span>
              </button>
            )}
          </div>
        </div>
        
        <Card className={`max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <Tabs defaultValue="all" className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 gap-2">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  onClick={() => setActiveCategory('all')}
                >
                  {faqTranslations.categories.all}
                </TabsTrigger>
                <TabsTrigger 
                  value="general" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  onClick={() => setActiveCategory('general')}
                >
                  {faqTranslations.categories.general}
                </TabsTrigger>
                <TabsTrigger 
                  value="germination" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  onClick={() => setActiveCategory('germination')}
                >
                  {faqTranslations.categories.germination}
                </TabsTrigger>
                <TabsTrigger 
                  value="strains" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  onClick={() => setActiveCategory('strains')}
                >
                  {faqTranslations.categories.strains}
                </TabsTrigger>
                <TabsTrigger 
                  value="shipping" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  onClick={() => setActiveCategory('shipping')}
                >
                  {faqTranslations.categories.shipping}
                </TabsTrigger>
              </TabsList>
            </div>
            
            {Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
              <TabsContent key={category} value={category} className="p-6">
                {categoryFaqs.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-icons text-4xl text-gray-400 mb-2">search_off</span>
                    <p className="text-gray-600">{faqTranslations.noResults}</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {categoryFaqs.map((faq, index) => (
                      <AccordionItem 
                        key={faq.id} 
                        value={faq.id}
                        className={`mb-4 border border-gray-100 rounded-lg overflow-hidden bg-white/50 hover:bg-white transition-all duration-300 shadow-sm hover:shadow ${
                          searchQuery && (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())) 
                            ? 'ring-2 ring-primary/20' 
                            : ''
                        }`}
                      >
                        <AccordionTrigger className="px-4 py-4 text-lg font-heading font-semibold text-primary hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="px-4 text-gray-700">
                          <p className="pb-2">{faq.answer}</p>
                          
                          {/* Related products for some questions */}
                          {faq.category === 'germination' && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="text-sm font-medium text-primary mb-2">{faqTranslations.recommendedProducts}</p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="bg-secondary/20 text-secondary-dark hover:bg-secondary/30">
                                  {(t as any).faq?.feminizedSeeds || "Premium Feminized Seeds"}
                                </Badge>
                                <Badge variant="secondary" className="bg-secondary/20 text-secondary-dark hover:bg-secondary/30">
                                  {(t as any).faq?.autofloweringSeeds || "Fast Autoflowering Seeds"}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </Card>
        
        {/* Still have questions */}
        <div className={`mt-12 max-w-2xl mx-auto text-center transition-all duration-700 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <h3 className="text-xl font-heading font-bold text-primary mb-4">
            {faqTranslations.stillHaveQuestions}
          </h3>
          <p className="text-gray-600 mb-6">
            {faqTranslations.supportText}
          </p>
          <Button className="bg-primary hover:bg-primary-dark text-white">
            <span className="material-icons mr-2">contact_support</span>
            {faqTranslations.contactSupport}
          </Button>
        </div>
      </div>
    </section>
  );
};
