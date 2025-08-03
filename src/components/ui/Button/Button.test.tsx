import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('클릭하면 부모한테 이벤트가 잘 전달된다', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    const { getByRole } = render(
      <Button onClick={handleClick}>클릭해주세요</Button>
    );

    const button = getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
