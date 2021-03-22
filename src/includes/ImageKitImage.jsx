const ImageKitImage = props => (
  <img src={`${props.src}?tr=w-800`}
       srcSet={`${props.src}?tr=w-800 1x, ${props.src}?tr=w-1600 2x`}
       loading="lazy"
  />
);

export default ImageKitImage;
