type IconKarmaProps = {
  className?: string;
};

export default function IconKarma({
  className = "block h-8 w-8 bg-current",
}: IconKarmaProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        maskImage: "url('/karma.svg')",
        maskPosition: "center",
        maskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskImage: "url('/karma.svg')",
        WebkitMaskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
      }}
    />
  );
}
