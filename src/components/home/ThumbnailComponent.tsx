'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide, SwiperRef } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Article, ArticleComponentProps } from '@/types/';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';


export default function ThumbnailComponent({
  articles,
  selectedIndex,
  setSelectedIndex,
}: ArticleComponentProps) {
  const swiperRef = useRef<SwiperRef>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Remove the useEffect that was syncing thumbnail swiper with selectedIndex

  return (
    <div className="relative w-full mx-auto px-10 pt-10 ">
      <Swiper
        ref={swiperRef}
        className="thumbnail-swiper"
        modules={[Navigation]}
        spaceBetween={10}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 15 },
          768: { slidesPerView: 4, spaceBetween: 20 },
          1024: { slidesPerView: 5, spaceBetween: 25 },
        }}
        onBeforeInit={(swiper) => {
          if (swiper.params.navigation && typeof swiper.params.navigation === 'object' && prevRef.current && nextRef.current) {
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
        // Remove onSlideChange to prevent thumbnail swiper from updating selectedIndex
        loop={true}
      >
        {articles.map((article, index) => (
          <SwiperSlide key={index}>
            <div
              className={`p-2 cursor-pointer transition-all duration-200 ease-in-out border-2 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 ${
                selectedIndex === index
                  ? 'border-blue-500 dark:border-blue-400'
                  : 'border-transparent'
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              <div className="relative w-full aspect-[16/9] mb-2">
                <Image
                  src={article.urlToImage}
                  alt={article.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  className="rounded-md object-cover"
                />
              </div>
              <h3 className="text-sm font-semibold text-center leading-tight ">
                {article.title}
              </h3>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Arrows */}
      <Button
        ref={prevRef}
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full  flex cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4 cursor-pointer" />
      </Button>
      <Button
        ref={nextRef}
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full  flex cursor-pointer"
      >
        <ChevronRight className="h-4 w-4 " />
      </Button>
    </div>
  );
}