import ImageKitImage from '../includes/ImageKitImage';

const Gallery = props => {
  return (
    <div className="custom-flexbin">
      {props.images.map(image => (
        <a href="#" key={image.name}>
          <ImageKitImage src={image.url} />
        </a>
      ))}
    </div>
  );
};

export default Gallery;
