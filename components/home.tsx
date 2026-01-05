import { Header } from "./header";
import { MyMap } from "./my-map";

const HomeComponent = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <MyMap />
        </div>
      </main>
    </div>
  );
};

export default HomeComponent;
