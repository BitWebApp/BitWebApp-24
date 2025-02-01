import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

const ReviewCarousel = () => {
  const data = [
    { name: "Kushagra Sahay", post: "Team Leader", roll: "123458", role: "Leader" },
    { name: "Sumit Kumar", post: "Team Leader", roll: "123459", role: "Leader" },
    { name: "Garvit Raj", post: "Backend Developer", roll: "123456", role: "Backend" },
    { name: "Ankit Verma", post: "Backend Developer", roll: "123457", role: "Backend" },
    { name: "Hritabhash Ray", post: "Frontend Developer", roll: "123460", role: "Frontend" },
    { name: "Parth Shresth", post: "Frontend Developer", roll: "123461", role: "Frontend" },
    { name: "Akshat Tambi", post: "Full Stack Developer", roll: "123462", role: "Full Stack" },
    { name: "Chirag Bhuwalka", post: "Frontend Developer", roll: "123463", role: "Frontend" },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center lg:px-32 px-5 bg-gradient-to-r from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center lg:flex-row justify-between mb-10 lg:mb-0">
        <h1 className="text-5xl font-bold text-center lg:text-start text-indigo-700 drop-shadow-lg">
          Meet The Developers
        </h1>
      </div>
      <div className="mt-10">
        <Swiper
          loop={true}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          navigation={true}
          modules={[Autoplay, EffectCoverflow, Pagination, Navigation]}
          className="mySwiper"
          effect={"coverflow"}
          coverflowEffect={{
            rotate: 15,
            stretch: 0,
            depth: 150,
            modifier: 2,
            slideShadows: true,
          }}
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 3, spaceBetween: 40 },
            1440: { slidesPerView: 4, spaceBetween: 50 },
          }}
        >
          {data.map((dev, index) => (
            <SwiperSlide
              key={index}
              className="bg-white text-black rounded-2xl shadow-lg transform transition-transform hover:scale-105 duration-300 cursor-pointer p-4 flex flex-col items-center justify-center h-[300px] lg:h-[350px]"
            >
              <div className="flex flex-col items-center h-full w-full text-center">
                <h1 className="text-2xl font-bold text-indigo-700">{dev.name}</h1>
                <p className="text-lg text-gray-600 mt-2">{dev.post}</p>
                <p className="text-sm text-gray-500 mt-1">Roll No: {dev.roll}</p>
                <span className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-full">
                  Role: {dev.role}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ReviewCarousel;
