import React, { useState } from 'react';
import Pagination from '@semcore/ui/pagination';
import { Text } from '@semcore/ui/typography';
import Select from '@semcore/ui/select';

const pageCount = 122360;

const Demo = () => {
  const [currentPage, updateCurrentPage] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateCurrentPage(currentPage);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Text tag="p" size={300}>{`Page number: ${currentPage}`}</Text>
      <Pagination
        currentPage={currentPage}
        onCurrentPageChange={updateCurrentPage}
        totalPages={pageCount}
      >
        <Pagination.FirstPage />
        <Pagination.PrevPage />
        <Pagination.NextPage />
        <Pagination.PageInput />
        <Pagination.TotalPages mr={4} />
      </Pagination>
    </form>
  );
};

export default Demo;
