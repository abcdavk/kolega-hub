import IconKarma from "../../app/icons/karma";

interface Barangprops {
    namaBarang: string;
    harga: number;
}

export default function BarangCard({namaBarang, harga}: Barangprops) {
  return (
    <>
      <div className="flex h-full flex-col rounded-xl bg-coal dark:bg-paper p-3 gap-2">
        <div className="bg-white rounded-xl h-35 h-max-45 w-full items-center justify-center">
          <h1 className="text-lg font-bold text-paper text-center dark:text-coal">ppp</h1>
        </div>

        <h2 className="text-2xl font-medium tracking-wide text-paper dark:text-coal">{namaBarang}</h2>
        <button
          type="button"
          className="mt-auto w-full h-12 flex rounded-lg bg-paper dark:bg-coal items-center px-4 text-md hover:scale-102 hover:translate-y-1 transition-transform duration-300 ease-out cursor-pointer group overflow-clip">
          <p className="text-coal dark:text-paper tracking-wide font-medium text-lg">Exchange</p>
          <div className="ml-auto flex items-center gap-1">
            <div className="flex flex-col gap-4 translate-y-15 group-hover:-translate-y-25 transition-transform duration-1000 ease-out">
              <IconKarma className="block h-6 w-6 bg-coal/50 dark:bg-paper/50" />
              <IconKarma className="block h-6 w-6 bg-coal/50 dark:bg-paper/50" />
              <IconKarma className="block h-6 w-6 bg-coal/50 dark:bg-paper/50" />
              <IconKarma className="block h-6 w-6 bg-coal/50 dark:bg-paper/50" />
              <IconKarma className="block h-6 w-6 bg-coal/50 dark:bg-paper/50" />
              <IconKarma className="block h-6 w-6 bg-coal/50 dark:bg-paper/50" />
            </div>
            <p className="text-coal dark:text-paper font-medium">{harga}</p>
          </div>
        </button>
      </div>
    </>
  );
}
