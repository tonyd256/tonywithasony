const Contact = () => {
  return (
    <>
      <h2 className="text-4xl mt-20 mb-10 text-center">Contact Me</h2>
      <form className="flex flex-col w-full max-w-4xl mx-auto" name="contact" method="POST" data-netlify="true" action="/thanks" netlify-honeypot="human-field">
        <div className="flex w-full">
          <input className="flex-1 my-4 mr-4 bg-gray-100 py-3 px-4 rounded placeholder-gray-500 outline-none focus:ring-2" name="name" id="name" type="text" placeholder="Name" required></input>
          <input className="flex-1 my-4 ml-4 bg-gray-100 py-3 px-4 rounded placeholder-gray-500 outline-none focus:ring-2" name="email" id="email" type="email" placeholder="Email" required></input>
        </div>
        <div className="opacity-0 absolute">
          <input name="human-field" id="human-field" type="text"></input>
        </div>
        <textarea className="py-3 px-4 appearance-none rounded bg-gray-100 placeholder-gray-500 outline-none focus:ring-2" name="message" id="message" placeholder="How can we work together?" rows="6" required></textarea>
        <input className="mt-4 rounded px-6 py-2 self-end bg-blue-500 hover:bg-blue-400 focus:bg-blue-600 outline-none text-white cursor-pointer" type="submit" id="submit" value="Send Message"></input>
      </form>
    </>
  );
};

export default Contact;
