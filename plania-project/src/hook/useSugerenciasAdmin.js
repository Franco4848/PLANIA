// src/hooks/useSugerenciasAdmin.js
import { gql, useQuery } from '@apollo/client';

const LISTAR_SUGERENCIAS = gql`
  query {
    sugerencias {
      _id
      mensaje
      emailAutor
    }
  }
`;

export function useSugerenciasAdmin() {
  const { data, loading, error } = useQuery(LISTAR_SUGERENCIAS);
  return { sugerencias: data?.sugerencias || [], loading, error };
}
