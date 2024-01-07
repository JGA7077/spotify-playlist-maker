import { render, screen, fireEvent } from "@testing-library/react";
import SearchArtist from "@/app/callback/SearchArtist";
import "@testing-library/jest-dom";

const requestTokenMock = 'BQBkU700MtzYTwaHbdum3NawOO5MyTG0rBoi_E2u4ObY7JQhTBH3ZVBPd19gagN7ZjXpt_Frd5cAsrSFS8ZDETm8OUGVuX6BDPwcLOfiPTM-BQPMOijrCAvX-fgiSBjUwR_2xHtbuNQ-yb0uLPamzMLrbqgCqbYJewNH6Wb4doIL_zAzcpyjT24I3sLlDTPeVmDQruAiMFmaub4bPv0sNl_P2AqmZPJMcaRRA88yvsbHuvN5MVS9XFG7_0aYHW5vEhBaVYQdum3T6hTVM6VbQKRVaoP23YBkFr2SRRp1yXVmL7E'

jest.mock('next/navigation', () => jest.requireActual('next-router-mock'))

describe('SearchArtist Component', () => {
  it('should render SearchArtist component', () => {
    render(<SearchArtist requestToken={requestTokenMock} />);

    screen.getByText('Selecione uma opção de pesquisa:');
  })

  it('should display error mensage when try click button without search option value', () => {
    render(<SearchArtist requestToken={requestTokenMock} />);

    const searchButton = screen.getByRole('button', {name: 'Pesquise'})

    fireEvent.click(searchButton);

    screen.getByText('Você deve selecionar uma opção.')
  })

  it('should display error mensage when try click button without search text', () => {
    render(<SearchArtist requestToken={requestTokenMock} />);

    const searchButton = screen.getByRole('button', {name: 'Pesquise'});
    const selectSearchOption = screen.getByLabelText('Selecione uma opção de pesquisa:');

    fireEvent.change(selectSearchOption, {target: {value: "track"}});
    fireEvent.click(searchButton);

    screen.getByText('Você deve fornecer pelo menos um item.')
  })
})