import React from 'react';
import { Review } from '../types';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="border-t pt-6">
      <div className="flex items-start">
        <img src={review.avatar} alt={review.author} className="w-12 h-12 rounded-full object-cover" />
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800">{review.author}</p>
              <p className="text-sm text-gray-500">{review.createdAt}</p>
            </div>
            <StarRating rating={review.rating} />
          </div>
          <p className="mt-2 text-gray-700">{review.comment}</p>
          {review.photos.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {review.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo.url}
                  alt={`review photo ${index + 1}`}
                  className="w-24 h-24 rounded-md object-cover cursor-pointer"
                />
              ))}
            </div>
          )}
          <div className="mt-3">
            <button className="flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1">
                <path d="M1 8.25a1.25 1.25 0 1 1 2.5 0v7.5a1.25 1.25 0 1 1-2.5 0v-7.5ZM11 3V1.7c0-.268.14-.516.371-.647A.75.75 0 0 1 12 1.7v1.362c.385.074.748.214 1.086.418.15.09.285.2.406.32.122.12.228.257.316.405.088.148.158.307.21.474.053.168.087.342.103.522.016.178.016.357.002.535a4.01 4.01 0 0 1-.347 1.513c-.126.39-.309.75-.54 1.082a5.284 5.284 0 0 1-2.186 1.956.5.5 0 0 1-.29.074H7.5a.5.5 0 0 1-.29-.074 5.284 5.284 0 0 1-2.186-1.956c-.23-.332-.414-.692-.54-1.082a4.01 4.01 0 0 1-.347-1.513 4.01 4.01 0 0 1 .002-.535c.016-.18.05-.354.103-.522.052-.167.122-.326.21-.474.088-.148.194-.285.316-.405.121-.121.256-.23.406-.32.338-.204.701-.344 1.086-.418V1.7c0-.268.14-.516.371-.647a.75.75 0 0 1 .878.647V3c.24.03.475.076.702.138.227.062.448.14.657.234.209.094.41.202.6.324.19.122.368.26.53.414.163.155.31.325.44.505.13.18.24.373.333.575.093.202.16.41.205.623.045.213.064.43.057.649a3.753 3.753 0 0 1-.027.534c-.039.24-.105.474-.194.697-.09.222-.204.434-.338.634-.135.2-.29.387-.46.56-.17.173-.35.327-.539.462-.188.135-.38.25-.572.344a4.445 4.445 0 0 1-3.23.002c-.192-.094-.384-.209-.572-.344a3.98 3.98 0 0 1-.539-.462c-.17-.173-.324-.36-.46-.56-.134-.2-.248-.412-.338-.634a3.81 3.81 0 0 1-.194-.697 3.753 3.753 0 0 1-.027-.534c.007-.219.026-.436.057-.649.045-.213.112-.421.205-.623.093-.202.203-.395.333-.575.13-.18.277-.35.44-.505.162-.154.34-.292.53-.414.19-.122.391-.23.6-.324.209-.093.43-.172.657-.234.227-.062.462-.108.702-.138Z" />
              </svg>
              参考になった ({review.helpfulCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;