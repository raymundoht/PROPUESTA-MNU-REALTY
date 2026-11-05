import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/brand/logo.png";

export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <Link href="/" aria-label="MNU Realty, inicio" className="inline-flex shrink-0">
      <Image src={logo} alt="MNU Realty" priority className={className} sizes="160px" />
    </Link>
  );
}
