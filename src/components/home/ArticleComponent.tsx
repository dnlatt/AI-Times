'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {  ArticleComponentProps } from '@/types/';
import { Swiper, SwiperSlide, SwiperRef } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function ArticleComponent({
  articles,
  selectedIndex,
  setSelectedIndex,
}: ArticleComponentProps) {
  const swiperRef = useRef<SwiperRef>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Sync Swiper with external selectedIndex
  useEffect(() => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slideToLoop(selectedIndex, 500);
    }
  }, [selectedIndex]);

  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Article Container */}
      <div className="relative w-full ">
        <Swiper
          ref={swiperRef}
          className="w-full"
          modules={[Navigation]}
          loop
          onBeforeInit={(swiper) => {
            if (swiper.params.navigation && typeof swiper.params.navigation === 'object') {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }
          }}
          onSwiper={(swiper) => {
            setTimeout(() => {
              if (
                swiper.params.navigation &&
                typeof swiper.params.navigation === 'object' &&
                prevRef.current &&
                nextRef.current
              ) {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
                swiper.navigation.destroy();
                swiper.navigation.init();
                swiper.navigation.update();
              }
            }, 0);
          }}
        >
          {articles.map((article, index) => {
            const contentBullets = article.content
              .split('.')
              .filter((s) => s.trim().length > 0);

            return (
              <SwiperSlide key={index} className="w-full">
                <div className="flex flex-col gap-4 md:gap-6">
                  {/* Title */}
                  <h1 className="text-lg md:text-2xl lg:text-3xl font-bold leading-snug break-words">
                    {article.title}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400 pb-3">
                    <span className="font-medium">
                      By: {article.author} | {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
                    >
                      Read Full Story →
                    </a>
                  </div>

                  {/* Content + Image */}
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Text */}
                    <div className="flex-1 min-w-0 order-2 lg:order-1">
                      <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm md:text-base leading-relaxed break-words">
                        {article.description}
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed break-words">
                        {contentBullets.map((sentence, bulletIndex) => (
                          <li key={bulletIndex}>{sentence}.</li>
                        ))}
                      </ul>
                    </div>

                    {/* Image */}
                    <div className="flex-1 order-1 lg:order-2 w-full min-w-0">
                      <div className="relative w-full aspect-[16/9]">
                        <Image
                          src={article.urlToImage}
                          alt={article.title}
                          fill
                          priority
                          className="rounded-lg object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      {/* Nav Arrows outside the article box */}
      {/* 
      <div className="flex justify-center gap-4 mt-2 max-w-4xl mx-auto">
        <Button
          ref={prevRef}
          variant="outline"
          size="sm"
          className="rounded-full w-8 h-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          ref={nextRef}
          variant="outline"
          size="sm"
          className="rounded-full w-8 h-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      */}
      </div>
      
    </>
  );
}
