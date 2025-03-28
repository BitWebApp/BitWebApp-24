import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Kushagra from "../assets/Kushagra.jpeg";
import Sumit from "../assets/Sumit.png";
import Parth from "../assets/Parth.jpeg";
import Akshat from "../assets/Akshat.jpeg";
import Ankit from "../assets/Ankit.jpeg";
import Hritabhash from "../assets/Hritabhash.jpg";
import Chirag from "../assets/Chirag.jpeg";
import Garvit from "../assets/Garvit.jpeg";

const ReviewCarousel = () => {
  const data = [
    { name: "Kushagra Sahay", post: "Team Leader", roll: "BTECH/10058/22", role: "Leader", image:  Kushagra},
    { name: "Sumit Kumar", post: "Team Leader", roll: "BTECH/10265/22", role: "Leader", image: Sumit },
    { name: "Garvit Raj", post: "Backend Developer", roll: "BTECH/10086/22", role: "Backend", image: Garvit },
    { name: "Ankit Verma", post: "Backend Developer", roll: "BTECH/10236/22", role: "Backend", image: Ankit },
    { name: "Hritabhash Ray", post: "Frontend Developer", roll: "BTECH/10449/22", role: "Frontend", image: Hritabhash },
    { name: "Parth Shresth", post: "Frontend Developer", roll: "BTECH/10325/22", role: "Frontend", image: Parth },
    { name: "Akshat Tambi", post: "Full Stack Developer", roll: "BTECH/10763/22", role: "Full Stack", image: Akshat },
    { name: "Chirag Bhuwalka", post: "Full Stack Developer", roll: "BTECH/10701/22", role: "Full Stack", image: Chirag }
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
                <img
                  src={dev.image}
                  alt={dev.name}
                  className="rounded-full w-24 h-24 object-cover mb-4"
                />
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