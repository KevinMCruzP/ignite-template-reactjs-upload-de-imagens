import { Box, Button, VStack } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';
import { CardList } from '../components/CardList';
import { Error } from '../components/Error';

import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
import { api } from '../services/api';

interface Image {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}
interface GetImagesResponse {
  after: string;
  data: Image[];
}

export default function Home(): JSX.Element {
  async function fetchImages({ pageParam = null }): Promise<GetImagesResponse> {
    const { data } = await api.get('/api/images', {
      params: {
        after: pageParam,
      },
    });
    return data;
  }

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery('images', fetchImages, {
    getNextPageParam: lastPage => lastPage?.after || null,
  });

  const formattedData = useMemo(() => {
    const formatedd = data?.pages.flatMap(image => {
      return image.data.flat();
    });

    return formatedd;
  }, [data]);

  if (isLoading && !isError) {
    return (
      <>
        <Loading />
      </>
    );
  }

  if (isError && !isLoading) {
    return (
      <>
        <Error />
      </>
    );
  }

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <VStack spacing="4">
          <CardList cards={formattedData} />
          {hasNextPage && (
            <Box w="100%">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
              </Button>
            </Box>
          )}
        </VStack>
      </Box>
    </>
  );
}
