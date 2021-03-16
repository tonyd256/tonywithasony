const ImageKitImage = props => (
  <img src={`${props.src}?tr=w-500,q-80`}
       srcSet={`${props.src}?tr=w-500,q-80 1x, ${props.src}?tr=w-1000,q-80 2x`}
       loading="lazy"
  />
);

export default ImageKitImage;
