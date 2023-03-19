export default function PageHeader({ children }: { children: React.ReactNode }) {
  return <h2 className="my-4 block text-xl font-bold uppercase leading-none text-gray-400">{children}</h2>;
}
