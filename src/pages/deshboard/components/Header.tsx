import SearchC from './SearchC';

type HeaderProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

const Header = ({ searchQuery, onSearchChange }: HeaderProps) => {
  return (
    <div className="flex justify-between mb-4 items-center bg-[#691B31] p-4 rounded-t-lg">
      <h2 className="text-2xl font-semibold text-white">Cuestionarios</h2>
      <SearchC searchQuery={searchQuery} onSearchChange={onSearchChange} />
    </div>
  );
};

export default Header;
