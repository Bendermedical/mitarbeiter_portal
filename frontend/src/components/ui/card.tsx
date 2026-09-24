import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: "comfortable" | "compact";
}

export const Card: React.FC<CardProps> = ({
  children,
  density = "comfortable",
  className = "",
  ...props
}) => {
  const paddingClass = density === "comfortable" ? "p-6" : "p-4";
  return (
    <div
      className={`bg-neutral-0 border border-neutral-200 rounded-md shadow-sm ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`pb-4 border-b border-neutral-100 flex items-center justify-between gap-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <h3 className={`text-lg font-semibold text-neutral-900 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`pt-4 ${className}`} {...props}>
    {children}
  </div>
);
