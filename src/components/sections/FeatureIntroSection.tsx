import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function FeatureIntroSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
      
      {/* Left image */}
      <div className="relative rounded-[5px] overflow-hidden shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
          alt="Property"
          className="w-full h-130 object-cover"
        />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition">
            <Play className="text-green-600 w-8 h-8 ml-1" />
          </div>
        </div>
      </div>

      {/* Right content */}
      <div>
        <h2 className="font-spartan text-4xl font-bold leading-tight text-gray-900">
          Efficiency. Transparency.
          <br />
          Control.
        </h2>

        <p className="mt-6 text-gray-500 leading-relaxed">
          Hously developed a platform for the Real Estate marketplace that allows
          buyers and sellers to easily execute a transaction on their own. The
          platform drives efficiency, cost transparency and control into the
          hands of the consumers. Hously is Real Estate Redefined.
        </p>

        <Button className="mt-8 bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-[5px] cursor-pointer">
          Learn More
        </Button>
      </div>

    </section>
  );
}
