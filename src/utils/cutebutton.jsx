export default function CuteButton({ text, onclick }) {
  // const size =['07','10','13','17','21','32','67'];
  // const color=['red','orange','yellow','green','blue','purple','pink'];
  // const style=['mono','sans','serif','cursive','fantasy','hacker','scratch'];

  // const all=[...size,...color,...style];
  return (
    <button
      className=" mx-3.5 my-4.5 p-2 px-3 bg-gradient-to-br from-gray-600 to-gray-900 rounded-lg text-white font-bold text-[9px]
    hover:from-gray-500 hover:to-gray-800 transition-colors
    hover:scale-110 active:scale-95"
      onClick={onclick}
    >
      {text}
    </button>
  );
}
