import { JSX, Match, Switch } from "solid-js";

import { useQuery } from "@tanstack/solid-query";
import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useModals } from "@revolt/modal";
import { Column, Row, typography } from "@revolt/ui";

import { Trans } from "@lingui-solid/solid/macro";
import { Symbol } from "@revolt/ui/components/utils/Symbol";
import { Profile } from "../features";

enum USER_FLAGS {
  SUSPENDED_UNTIL = 1 << 0,
  DELETED = 1 << 1,
  BANNED = 1 << 2,
  SPAM = 1 << 3,
}

/**
 * Check whether the user has a flag
 */
function hasFlag(a: number, b: number) {
  return (a & b) !== 0;
}

/**
 * Base element for the card
 */
const base = cva({
  base: {
    // padding: "var(--gap-md)",

    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-high)",
    boxShadow: "0 0 3px var(--md-sys-color-shadow)",

    width: "340px",
    height: "400px",

    borderRadius: "var(--borderRadius-xl)",
  },
});

/**
 * User Card
 */
export function UserCard(
  props: JSX.Directives["floating"]["userCard"] &
    object & { onClose: () => void },
) {
  const { openModal } = useModals();
  const query = useQuery(() => ({
    queryKey: ["profile", props.user.id],
    queryFn: () => props.user.fetchProfile(),
  }));

  function openFull() {
    openModal({ type: "user_profile", user: props.user });
    props.onClose();
  }

  return (
    <div
      use:invisibleScrollable={{ class: base() }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
      }}
    >
      <Switch
        fallback={
          <Grid>
            <Profile.Banner
              width={2}
              user={props.user}
              member={props.member}
              bannerUrl={query.data?.animatedBannerURL}
              onClick={openFull}
            />

            <Profile.Actions
              user={props.user}
              member={props.member}
              width={2}
            />
            <Profile.Roles member={props.member} />
            <Profile.Badges user={props.user} />
            <Profile.Status user={props.user} />
            <Profile.Joined user={props.user} member={props.member} />
            <Profile.Bio content={query.data?.content} onClick={openFull} />
          </Grid>
        }
      >
        <Match
          when={hasFlag(
            props.user.flags,
            USER_FLAGS.BANNED + USER_FLAGS.SPAM + USER_FLAGS.SUSPENDED_UNTIL,
          )}
        >
          <Centre>
            <Column align gap="lg">
              <Row justify>
                <Symbol size={32}>security</Symbol>
              </Row>

              <CentredText>
                <Trans>
                  User {props.user.username}#{props.user.discriminator} is
                  suspended
                </Trans>
              </CentredText>
            </Column>
          </Centre>
        </Match>
      </Switch>
    </div>
  );
}

const Grid = styled("div", {
  base: {
    display: "grid",
    gap: "var(--gap-md)",
    padding: "var(--gap-md)",
    gridTemplateColumns: "repeat(2, 1fr)",
  },
});

const Centre = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: "1",
    height: "100%",
  },
});

const CentredText = styled("span", {
  base: {
    ...typography.raw({ class: "title", size: "small" }),
    textAlign: "center",
  },
});
