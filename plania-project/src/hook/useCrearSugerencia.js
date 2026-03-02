// src/hooks/useCrearSugerencia.js
import { gql, useMutation } from '@apollo/client';

const CREAR_SUGERENCIA = gql`
  mutation CrearSugerencia($mensaje: String!) {
    crearSugerencia(input: { mensaje: $mensaje }) {
      _id
      mensaje
      emailAutor
    }
  }
`;

export function useCrearSugerencia() {
  const [crearSugerencia, { data, loading, error }] = useMutation(CREAR_SUGERENCIA);
  return { crearSugerencia, data, loading, error };
}
