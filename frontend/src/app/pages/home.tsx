import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Hero } from "../components/hero";
import { Features } from "../components/features";
import { WordDetail } from "../components/word-detail";

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedWord, setSelectedWord] = useState<string | null>(
    searchParams.get("kata")
  );

  // Sync state from URL param "kata"
  useEffect(() => {
    setSelectedWord(searchParams.get("kata"));
  }, [searchParams]);

  const handleSelectWord = (id: string) => {
    setSearchParams((p) => {
      p.set("kata", id);
      return p;
    });
  };

  const handleClose = () => {
    setSearchParams((p) => {
      p.delete("kata");
      return p;
    });
  };

  return (
    <>
      <Hero onSelectWord={handleSelectWord} />
      <Features />
      {selectedWord && (
        <WordDetail
          wordId={selectedWord}
          onClose={handleClose}
          onSelectWord={handleSelectWord}
        />
      )}
    </>
  );
}
