import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

const ReviewCarousel = () => {
  const data = [
    {
      name: "Garvit",
      specialties: "BitWebApp has revolutionized how I manage my academic records and projects. The ease of uploading and accessing my higher examination details and internships is unparalleled. It's a must-have for every student aiming for excellence!",
    },
    {
      name: "Ankit",
      specialties: "BitWebApp's ability to store and organize all my academic and internship records in one place is fantastic. The review functionality is a great addition, helping me share my experiences with peers. An excellent tool for students!",
    },
    {
      name: "Kushagra",
      specialties: "BitWebApp is an invaluable tool for any student. It keeps all my academic records, project details, and internship information organized and easily accessible. I highly recommend it to all my peers!",
    },
    {
      name: "Sumit Kun",
      specialties: "BitWebApp has been a game-changer for me. Managing my academic and higher examination details has never been this simple. The platform's user-friendly design makes it an essential tool for every student.",
    },
    {
      name: "Hritabhash",
      specialties: "I can't imagine my student life without BitWebApp. The convenience of having all my academic records, exam details, and internship information in one place is incredible. The review feature is great for sharing feedback with the admin.",
    },
    {
      name: "Parth",
      specialties: "BitWebApp provides a holistic solution for managing student data. Uploading my academic records and tracking my placements has never been easier. The admin's ability to access all data ensures efficient management. A brilliant platform for students!",
    },
    {
      name: "Akshat",
      specialties: "The seamless interface of BitWebApp makes it incredibly easy to track my placements and exam details. It's a comprehensive platform that has significantly improved my academic journey. Highly recommended!"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center lg:px-32 px-5 bg-gray-200">
      <div className="flex flex-col items-center lg:flex-row justify-between mb-10 lg:mb-0">
        <div>
          <h1 className="text-4xl font-semibold text-center lg:text-start">
            Testimonials
          </h1>
        </div>
      </div>
      <div className="mt-5">
        <Swiper
          loop={true}
          pagination={{
            clickable: true,
          }}
          autoplay={{ delay: 3000 }}
          navigation={true}
          modules={[Autoplay, EffectCoverflow, Pagination, Navigation]}
          className="mySwiper"
          effect={"coverflow"}
          coverflowEffect={{
            rotate: 10,
            stretch: 50,
            depth: 200,
            modifier: 1,
            slideShadows: true,
          }}
          breakpoints={{
            640: {
              slidesPerView: 1,
              spaceBetween: 6, // Adjust space between slides
            },
            768: {
              slidesPerView: 1,
              spaceBetween: 8, // Adjust space between slides
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 10, // Adjust space between slides
            },
            1440: {
              slidesPerView: 5, // Ensure 5 slides are visible
              spaceBetween: 10, // Adjust space between slides
            },
          }}
        >
          {data.map((e, index) => (
            <SwiperSlide 
              key={index} 
              className="
                swiper-slide bg-gray-50 text-black rounded-xl mb-2 cursor-pointer p-1 flex flex-col justify-center items-center
                h-[250px] lg:h-[400px] xl:h-[300px] 2xl:h-[400px]"
            >
              <div className="flex flex-col justify-center items-center h-full w-full text-center overflow-hidden">
                <div className="flex-col justify-center items-center h-full overflow-y-auto p-2">
                  <h2 className="pt-1 text-xl lg:text-lg overflow-hidden">{e.specialties}</h2>
                  <h1 className="font-medium text-lg md:text-xl lg:text-2xl pt-3 pb-1">{e.name}</h1>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ReviewCarousel;
