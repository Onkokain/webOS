function Button(args) {
        const color=args.color || "white";
    return (
        <>
        <span className=" rounded-full p-2 text-white m-1" 
        style={{ backgroundColor: color }}/>

        </>
    )

}
export default Button;