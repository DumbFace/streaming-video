export function TypographyH1({ text }: TypographyComponentProps) {
  return (
    <h1 className="scroll-m-20  text-4xl font-extrabold tracking-tight text-balance">
      {text}
    </h1>
  );
}

export function TypographyH2({ text }: TypographyComponentProps) {
  return (
    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
      {text}
    </h2>
  );
}
export function TypographyH3({ text }: TypographyComponentProps) {
  return (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
      {text}
    </h3>
  );
}

export function TypographyH4({ text }: TypographyComponentProps) {
  return (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{text}</h4>
  );
}

export function TypographyP({ text }: TypographyComponentProps) {
  return <p className="leading-7 [&:not(:first-child)]:mt-6">{text}</p>;
}

type TypographyComponentProps = {
  text: string;
};